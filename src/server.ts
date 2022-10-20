import express from 'express';
import { prisma } from './prisma/client';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import hashPassword from './utils/hashPassword';
import validatePassword from './utils/validatePassword';
import generateToken from './Token/generateToken';
import {verificaToken} from './middleware/authMiddleware';
import Decode from './Token/decodeToken';
import { JwtPayload } from 'jsonwebtoken';
import { convertStringHourToMinute } from './utils/convert-stringHours-to-minutes';
import convertMinutesToHourString from './utils/convert-minutes-to-hour-string';

const app = express()
const URL = "192.168.149.214"
app.use(express.json());
app.use(cors());

app.get("/users", async (request, response) => {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    tasks: true
                }
            }
        }
    })
    return response.json(users)
})

app.post("/users", async (request, response) => {

    const body:any = request.body

    const userAlredyExists = await prisma.user.findUnique({
        where: {
            email: body.email
            }
        })

    if (userAlredyExists) {
        return response.status(400).json({
            message: "Email already exists, try to login in your account"
        })
    }

    const hashedPassword = await hashPassword(body.password)
    
    const user = await prisma.user.create({
        data: {
            name: body.name,
            email: body.email,
            password: hashedPassword,
        }
    })

    return response.status(201).json(user)
})

app.post("/auth", async (request, response) => {

    const body:any = request.body

    const user = await prisma.user.findUnique({
        where: {
            email: body.email
            },
            include: {
                _count: {
                    select: {
                        tasks: true
                    }
                }
            }
        })
    if (!user) {
        return response.status(401).json({
            code: 401,
            message: "This user don't exists"
        })
    }

    const isValid = await validatePassword(body.password, user.password)

    if (!isValid) {
        return response.status(401).json({
            code: 401,
            error: "Incorrect password!"
        })
    } 

    const token = generateToken(user)

    return response.status(201).json({
        token: token
    })
})

app.get("/task", verificaToken, async (request, response) => {

    const auth = request.headers.authorization as string;
    
    const tokenDecoded = Decode(auth) as JwtPayload;

    const userId = tokenDecoded.id;

    const tasks = await prisma.task.findMany({
        select: {
            id: true,
            userId: true,
            title: true,
            description: true,
            hourStart: true,
        },
        where: {
            userId,
        },
        orderBy: {
            created_at: 'desc'
        }
    })

    return response.json(tasks.map((task) => {
        return {
            ...task,
            hourStart: convertMinutesToHourString(task.hourStart)
        }
    }))
})

app.post("/task", verificaToken, async (request, response) => {
    
    const auth = request.headers.authorization as string;
    
    const tokenDecoded = Decode(auth) as JwtPayload;

    const userId = tokenDecoded.id;

    const body: any = request.body;
    
    const task = await prisma.task.create({
        data: {
            userId,
            title: body.title,
            description: body.description,
            hourStart: convertStringHourToMinute(body.hourStart)
        }
    })
    
    return response.status(201).json(task)
})

app.delete("/task/:id", verificaToken, async (request, response) => {

    const auth = request.headers.authorization as string;
    
    const tokenDecoded = Decode(auth) as JwtPayload;

    const deleteTask = prisma.task.delete({
        where: {
            id: request.params.id
        }
    })
    
    await prisma.$transaction([deleteTask])
})

app.listen(3030, URL, () => console.log("Server http running in port 3030"))
https.createServer({
    cert: fs.readFileSync('./src/SSL/code.crt'),
    key: fs.readFileSync('./src/SSL/code.key')
}, app).listen(3031, URL,() => console.log("Server https running in 3031"))
