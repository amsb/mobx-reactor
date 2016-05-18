import test from 'ava'

import { observable, map } from 'mobx'
import { Substore, action } from '../src/substore'
import { Store } from '../src/store'

test(t => {
  let nextPersonId = 1
  class Person extends Substore {
    @observable name = ''
    constructor(name) {
      super()
      this.id = nextPersonId++
      this.name = name
    }
  }

  class Contacts extends Substore {
    @observable people = map()

    @action('addPerson')
    addPerson(name) {
      const person = new Person(name)
      this.people.set(person.id, person)
    }

  }

  const store = new Store({
    contacts: new Contacts()
  })

  t.same(
    Object.keys(store.actions),
    ["scheduleAction","addPerson"]
  )
})
