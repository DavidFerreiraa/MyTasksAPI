import 'bcrypt';

export default function hashPassword(Password: string) {

    const bcrypt = require('bcrypt')

    const hashedPassword = bcrypt.hash(Password, 10)

    return hashedPassword;
}