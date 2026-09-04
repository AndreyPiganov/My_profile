import { Injectable } from '@nestjs/common';

export interface ApplicationInfo {
  name: string;
  graphqlEndpoint: string;
}

@Injectable()
export class AppService {
  getInfo(): ApplicationInfo {
    return {
      name: 'Digital Business Card API',
      graphqlEndpoint: '/graphql',
    };
  }
}
