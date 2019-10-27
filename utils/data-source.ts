import { DataSource, DataSourceConfig } from "apollo-datasource";
import Mongoose from "mongoose";

export class MongoSource<
  TContext extends any,
  M extends Mongoose.Document
> extends DataSource<TContext> {
  public context: TContext;
  private collection: Mongoose.Model<M, {}>;

  constructor(collection: Mongoose.Model<M, {}>) {
    super();

    this.collection = collection;
  }

  public initialize({ context, cache }: DataSourceConfig<TContext>) {
    this.context = context;

    return this;
  }

  public async update<T>(body: T, id: string, user: string): Promise<M> {
    return await this.collection.findOneAndUpdate(
      { id, user: { $eq: user } },
      body,
      {
        upsert: true
      }
    );
  }

  public async getAll(user: string): Promise<M[]> {
    return await this.collection.find({ user: { $eq: user } });
  }

  public async find(id: string, user?: string): Promise<M> {
    return user
      ? await this.collection.findOne({
          id,
          user: { $eq: user }
        })
      : this.collection.findOne({ id });
  }

  public async findByRef(_id: string): Promise<M> {
    return await this.collection.findOne({ _id });
  }

  public async findByCondition(condition: any): Promise<M> {
    return await this.collection.findOne(condition);
  }

  public async create<T>(body: T): Promise<M> {
    return await this.collection.create(body);
  }

  public async remove(id: string, user: string): Promise<M> {
    return await this.collection.findOneAndRemove({
      id,
      user: { $eq: user }
    });
  }
}
