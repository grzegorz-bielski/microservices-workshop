import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'message',
})
export class Message {
  public static create(data: Partial<Message>): Message {
    const entity = new Message();
    Object.assign(entity, data);
    return entity;
  }

  @PrimaryColumn({ type: 'uuid' })
  public id: string;

  @Column({ type: 'text' })
  public content: string;

  @Column({ type: 'bigint' })
  public createdAt: number;

  @Column()
  public username: string;
}
