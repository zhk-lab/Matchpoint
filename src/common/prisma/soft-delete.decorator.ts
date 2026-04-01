import { PrismaClientExtended } from './prisma.service';

export function UseSoftDelete(
  model: string,
): (p: PrismaClientExtended) => PrismaClientExtended {
  model = model.charAt(0).toLowerCase() + model.slice(1);
  return (client) => {
    return client.$extends({
      query: {
        [model]: {
          $allOperations({ args, query }: any) {
            if (args.where) args.where = { ...args.where, deletedAt: null };
            return query(args);
          },
        },
      } as any,
    }) as PrismaClientExtended;
  };
}
