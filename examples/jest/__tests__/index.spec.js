"use strict"

const getMeDogs = require("../index").getMeDogs

describe("Dog's API", () => {
  let url = "http://localhost"

  const EXPECTED_BODY = [
    {
      dog: 1,
    },
  ]

  describe("works", () => {
    beforeEach(() => {
      const interaction = {
        state: "i have a list of projects",
        uponReceiving: "a request for projects",
        withRequest: {
          method: "GET",
          path: "/dogs",
          headers: {
            Accept: "application/json",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: EXPECTED_BODY,
        },
      }
      return provider.addInteraction(interaction)
    })

    // add expectations
    it("returns a sucessful body", () => {
      return getMeDogs({
        url,
        port,
      })
        .then(response => {
          expect(response.headers["content-type"]).toEqual("application/json")
          expect(response.data).toEqual(EXPECTED_BODY)
          expect(response.status).toEqual(200)
        })
        .then(() => provider.verify())
    })
  })
})
