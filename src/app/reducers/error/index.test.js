import expect from 'expect'
import reducer, { initialState } from 'app/reducers/error'

describe('reducers/error', () => {
  it('should initialize properly', () => {
    expect(reducer(undefined, { })).toEqual(initialState)
  })
})
