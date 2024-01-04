/**
 * File:        /tests/devices.mjs
 * Description:
 *
 * Date        By     Comments
 * ----------  -----  ------------------------------
 * 2024-01-03  C2RLO  Initial
 */

const faker = require("@faker-js/faker")
const request = require("supertest")
const express = require("express")

const deviceType = [
  { name: "Bridge", description: "" },
  { name: "CoolAir", description: "" },
  { name: "Copier", description: "" },
  { name: "Desktop", description: "" },
  { name: "Firewall", description: "" },
  { name: "Getaway", description: "" },
  { name: "Hubs", description: "" },
  { name: "Load Balancer", description: "" },
  { name: "Modem", description: "" },
  { name: "Multiplexer", description: "" },
  { name: "PDU System", description: "" },
  { name: "Power", description: "" },
  { name: "Printer", description: "" },
  { name: "Probe", description: "" },
  { name: "Repeaters", description: "" },
  { name: "Router", description: "" },
  { name: "Security Device", description: "" },
  { name: "Server", description: "" },
  { name: "Switch", description: "" },
  { name: "Telephone", description: "" },
  { name: "Terminal", description: "" },
  { name: "Traffic shaper", description: "" },
  { name: "Transceiver", description: "" },
  { name: "UPS System", description: "" },
  { name: "Workstations", description: "" },
]

const deviceCategory = [
  {
    name: "Connectivity",
    description: "Data centers often have multiple fiber connections to the internet provided by multiple carriers.",
  },
  {
    name: "Facility",
    description:
      "Data center buildings may be specifically designed as a data center. For example, the height of ceilings will match requirements for racks and overhead systems. In some cases, a data center occupies a floor of an existing building.",
  },
  {
    name: "Site",
    description:
      "A data center requires a site with connections to grids, networks and physical <a href=\"https://simplicable.com/new/infrastructure\">infrastructure</a>  such as roads. Proximity to markets, customers, employees and services also play a role in selecting an appropriate site. Locating data centers in cold climates can reduce cooling costs.",
  },
]

const app = express()

describe("get /devices", () => {
  it("should get one device", async () => {
    return new Promise((resolve, reject) => {
      try {
        request(app)
          .get("/devices")
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(resolve.statusCode)
          .toBe(200)
          .expect(resolve.body.length)
          .toBeGreaterThan(0)

        expect.assertions(1)
      } catch (error) {
        resolve(error).expect(error.statusCode).not.toBe(200)
      }
    })
  }, 8000)
})
