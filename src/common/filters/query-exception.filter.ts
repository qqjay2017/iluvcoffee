import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryExceptionFilter<T extends QueryFailedError>
  implements ExceptionFilter
{
  catch(exception: T, host: ArgumentsHost) {
    console.log(exception, host);
    // const ctx = host.switchToHttp();
    // const response = ctx.getResponse<Response>();
    // const status = exception.getStatus();
    // console.log(status, 'status');
    // const exceptionResponse = exception.getResponse();
    // const error =
    //   typeof exceptionResponse == 'string'
    //     ? {
    //         message: exceptionResponse,
    //       }
    //     : (exceptionResponse as object);
    // response.status(status).json({
    //   ...error,
    //   timestamp: new Date().toISOString(),
    // });
    throw new BadRequestException(`123`);
  }
}
