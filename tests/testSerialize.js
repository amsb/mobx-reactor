import test from 'ava'

import { observable, computed, map } from 'mobx'
import { serialize } from '../src/serialize'

test(t => {
    let nextPersonId = 1
    class Person {
      @observable firstName = ''
      @observable lastName = ''
      @observable tags = []

      constructor(firstName, lastName, tags=[]) {
        this.id = (nextPersonId++).toString()
        this.firstName = firstName
        this.lastName = lastName
        this.tags.push(...tags)
      }
    }

    class Contacts {
      @observable people = map()

      @computed get numContacts() {
        return this.people.size
      }

      addPerson(firstName, lastName, tags=[]) {
        const person = new Person(firstName, lastName, tags)
        this.people.set(person.id, person)
      }
    }

    const contacts = new Contacts()
    contacts.addPerson('Maarten', 'Luther', ['Protestant Reformation'])
    contacts.addPerson('Katharina', 'von Bora')

    const person1 = {
      "id": "1",
      "firstName": "Maarten",
      "lastName": "Luther",
      "tags": ["Protestant Reformation"]
    }

    const result = serialize(contacts)
    t.same(Object.getPrototypeOf(result.people).constructor.name, 'Object')
    t.same(result.people['1'], person1)
    t.same(result.people['1'].tags[0], 'Protestant Reformation')
    t.same(result.numContacts, undefined)

    const resultWithMap = serialize(contacts, { keepMap: true })
    t.same(Object.getPrototypeOf(resultWithMap.people).constructor.name, 'Map')
    t.same(resultWithMap.people.get('1'), person1)
    t.same(resultWithMap.people.get('1').tags[0], 'Protestant Reformation')

    const resultwithComputed = serialize(contacts, { keepMap: false, withComputed: true })
    t.same(resultwithComputed.people['1'].tags[0], 'Protestant Reformation')
    t.same(contacts.numContacts, 2)
    t.same(resultwithComputed.numContacts, 2)
})
