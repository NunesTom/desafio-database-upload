import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CategoryService from './CreateCategoryService';
import TransactionsRepository from '../repositories/TransactionsRepository';
// import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

interface ReqCategory {
  title: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category_title,
  }: Request): Promise<Transaction> {
    const categoryService = new CategoryService();

    const category = await categoryService.execute(category_title);

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      const checkBalance = balance.income - (balance.outcome + value);

      if (checkBalance < 0) {
        throw new AppError('Value of outcome is insufficient');
      }
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
