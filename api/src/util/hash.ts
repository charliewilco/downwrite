import * as bcrypt from "bcrypt";

type HashingCallback = (err: Error, hash: string) => void;

export function hashPassword(password: string, cb: HashingCallback) {
  // Generate a salt at level 10 strength
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      return cb(err, hash);
    });
  });
}

module.exports = hashPassword;
