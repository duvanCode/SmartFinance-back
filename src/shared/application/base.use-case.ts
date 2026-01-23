export interface UseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}

export abstract class BaseUseCase<TInput, TOutput>
  implements UseCase<TInput, TOutput>
{
  abstract execute(input: TInput): Promise<TOutput>;
}
