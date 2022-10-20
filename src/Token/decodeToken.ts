import jwt from 'jsonwebtoken';

export default function Decode(token: string) {
    const [, myToken] = token.split(" ")
    const tokenDecoded =  jwt.verify(myToken, "my-secret-key")
    return tokenDecoded;
}