import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from 'src/modules/auth/dto/register.dto';
import { User } from 'src/database/typeorm/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  findByRefreshToken(refreshToken: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { refreshToken } });
  }

  create(registerDto: RegisterDto) {
    const user = this.userRepository.create({ ...registerDto });
    return this.userRepository.save(user);
  }

  update(id: number, data: Partial<User>) {
    return this.userRepository.update(id, data);
  }
}
