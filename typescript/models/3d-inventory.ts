/*
 * File:        /src/models/3d-inventory.ts
 * Description: data models from ModngoDB
 * Used by:
 * Dependency:
 *
 * Date        By       Comments
 * ----------  -------  ------------------------------
 * 2023-11-22  C2RLO    Initial
 */
import { ObjectId } from "mongodb"
import Realm from "realm"

export type attributeDictionary = {
  _id: ObjectId
  category: string
  component: string
  name?: string
  type?: string
}

export const attributeDictionarySchema = {
  name: "attribute-dictionary",
  properties: {
    _id: "objectId",
    category: "string",
    component: "string",
    name: "string?",
    type: "string?",
  },
  primaryKey: "_id",
}



export type device_position = {
  h?: string
  x?: string
  y?: string
}

export const devicePositionSchema = {
  name: "device_position",
  embedded: true,
  properties: {
    h: "string?",
    x: "string?",
    y: "string?",
  },
}

export type device = {
  _id?: ObjectId
  modelId?: ObjectId
  name?: string
  position?: device_position
}

export const deviceSchema = {
  name: "device",
  properties: {
    _id: "objectId?",
    modelId: "objectId?",
    name: "string?",
    position: "device_position",
  },
  primaryKey: "_id",
}



export type floor_adress = {
  city?: string
  country?: string
  postcode?: string
  street?: string
}

export const floorAdressSchema = {
  name: "floor_adress",
  embedded: true,
  properties: {
    city: "string?",
    country: "string?",
    postcode: "string?",
    street: "string?",
  },
}




export type floorDimension = {
  description?: string
  h?: string
  h_pos?: string
  x?: string
  x_pos?: string
  y?: string
  y_pos?: string
}

export const floorDimensionSchema = {
  name: "floorDimension",
  embedded: true,
  properties: {
    description: "string?",
    h: "string?",
    h_pos: "string?",
    x: "string?",
    x_pos: "string?",
    y: "string?",
    y_pos: "string?",
  },
}

export type floor = {
  _id: ObjectId
  adress?: floor_adress
  dimension: Realm.List<floorDimension>
  name: string
}

export const floorSchema = {
  name: "floor",
  properties: {
    _id: "objectId",
    adress: "floor_adress",
    dimension: "floorDimension[]",
    name: "string",
  },
  primaryKey: "_id",
}


export type log = {
  _id: ObjectId
  component?: string
  date: string
  message?: string
  object?: string
  operation?: string
}

export const logSchema = {
  name: "log",
  properties: {
    _id: "objectId",
    component: "string?",
    date: "string",
    message: "string?",
    object: "string?",
    operation: "string?",
  },
  primaryKey: "_id",
}


export type user = {
  _id: ObjectId
  email?: string
  name?: string
  password?: string
  rights: Realm.List<string>
  token?: string
}
export const userSchema = {
  name: "user",
  properties: {
    _id: "objectId",
    email: "string?",
    name: "string?",
    password: "string?",
    rights: "string[]",
    token: "string?",
  },
  primaryKey: "_id",
}

export default { userSchema }
