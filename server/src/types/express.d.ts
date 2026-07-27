import { User, Visitor } from '../../generated/prisma/index.js';

declare global {
    namespace Express {
        interface Request {
            user?: Omit<User, 'passwordHash' | 'refreshToken'>;
            visitor?: Visitor;
            uploadType?: 'agent' | 'visitor';
        }
    }
}
