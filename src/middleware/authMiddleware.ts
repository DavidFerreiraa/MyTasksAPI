import Decode from '../Token/decodeToken'


export function verificaToken(req: any, res: any, next: any) {
        try {
            const auth = req.headers.authorization
            const [, token] = auth.split(" ")
            if (auth) {
                const valid = Decode(auth)
                next()
            } else {
                return res.send(401, "Token não Recebido")
            }
        } catch (error: any) {
            return res.status(401).send(error.message)
        }
    }
