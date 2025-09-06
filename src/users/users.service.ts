import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  logger: Logger;
  constructor(@InjectModel(User.name) private userModel: Model<User>) {
    this.logger = new Logger(UsersService.name);
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log('[findByEmail] Finding user with email ', email);
    const user = await this.userModel.findOne({ email });
    this.logger.log('[findByEmail] Found user wih email ', email, user);
    return user;
  }

  async create(email: string, name: string, password: string) {
    const userExists = await this.findByEmail(email);
    if (userExists) {
      this.logger.log(`[create] User with email ${email} already exists`);
      throw new ConflictException(`User with email ${email} already exists`);
    }

    this.logger.log(
      `[create] Creating user with email ${email},and name ${name}`,
    );
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      name,
      password: hashedPassword,
    });
    const res = await newUser.save();
    this.logger.log(
      `[create] Created user with email ${email},and name ${name} Successfully`,
    );
    return res;
  }
}
