import 'bcrypt';

export default function validatePassword(Password: string, hash: string) {
    const bcrypt = require('bcrypt');

    const result = bcrypt.compare(Password, hash)

    return result;
}