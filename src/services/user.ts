import { NotFoundError } from '~/models';
import { messages } from '~/resources';
import { prisma } from '~/utils';

export class UserService {
  static async createUser(
    email: string,
    firstName: string,
    lastName: string,
    firebaseId: string
  ) {
    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        firebaseId
      }
    });
    return user;
  }

  static async findUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundError(messages.notFound('user', id));
    }

    return user;
  }

  static async findUsers() {
    const users = await prisma.user.findMany();
    return users;
  }
  static async updateUser(
    id: string,
    email: string,
    firstName: string,
    lastName: string
  ) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        firstName,
        lastName
      }
    });
    return user;
  }

  static async deleteUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundError(messages.notFound('user', id));
    }

    await prisma.user.delete({
      where: { id }
    });

    return { message: messages.deleted('user') };
  }
}
