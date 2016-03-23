import test from 'ava'

import { observable, computed, map } from 'mobx'
import { serialize } from '../src/serialize'
import { Model, action } from '../src/model'

test(t => {
    let nextPersonId = 1
    class Person {
      @observable firstName = ''
      @observable lastName = ''
      @observable tags = []

      constructor(firstName, lastName) {
        this.id = (nextPersonId++).toString()
        this.firstName = firstName
        this.lastName = lastName
      }
    }

    class Contacts {
      @observable people = map()

      addPerson(firstName, lastName) {
        const person = new Person(firstName, lastName)
        this.people.set(person.id, person)
      }
    }

    const contacts = new Contacts()
    contacts.addPerson('Maarten', 'Luther')

    const result = serialize(contacts)
    const target = {
      "people": new Map([
        ["0", {
          "id": 0,
          "firstName": "Maarten",
          "lastName": "Luther"}
        ]
      ])
    }

    t.same(result.people[0], target.people[0])
})

test(t => {
    let nextPersonId = 1
    class Person extends Model {
      @observable firstName = ''
      @observable lastName = ''
      @observable tags = []

      constructor(firstName, lastName) {
        super()
        this.id = (nextPersonId++).toString()
        this.firstName = firstName
        this.lastName = lastName
      }
    }

    class Contacts extends Model  {
      @observable people = map()

      @computed get contactsCount() {
        return this.people.size
      }

      @action('addContact')
      addPerson(firstName, lastName) {
        const person = new Person(firstName, lastName)
        this.people.set(person.id, person)
      }
    }

    const contacts = new Contacts()
    contacts.addPerson('Maarten', 'Luther')
    contacts.addPerson('Katharina', 'von Bora')

    console.log(serialize(contacts))

    const result = serialize(contacts)
    const target = {
      "people": new Map([
        ["0", {
          "id": 0,
          "firstName": "Maarten",
          "lastName": "Luther"}
        ]
      ])
    }

    t.same(result.people[0], target.people[0])
})
