import type { Request, Response } from 'express';

const cheakHealth = (req: Request, res: Response) => {
    res.status(200).json({ message: "ok" })
}

export { cheakHealth }
