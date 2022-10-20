import jwt from 'jsonwebtoken';

export default function generateToken(payload: object): string {
    return jwt.sign(payload, "my-secret-key", {
        expiresIn: "2 days"
    })
}