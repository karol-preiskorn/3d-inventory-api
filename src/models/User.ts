import bcrypt from "bcrypt-nodejs"
import crypto from "crypto"
import schema from "../models/3d-inventory"

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => void) => void



