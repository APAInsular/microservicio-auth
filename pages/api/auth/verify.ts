// pages/api/auth/verify.ts
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../../types';

export default function verify(req: NextApiRequest, res: NextApiResponse): void {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        res.status(200).json({ message: 'Token valid', decoded });
    } catch (err) {
        if (err instanceof Error) {
            res.status(401).json({ error: `Invalid token: ${err.message}` });
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    }
}
