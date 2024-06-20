import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import configs from '../utils/configs.js';

const router = express.Router();

// 회원가입 API
router.post('/signUp', async (req, res, next) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(401).json({ errorMessage: '입력 값이 잘못되었습니다.' });
    }
    // 아이디 중복 확인 테스트
    const isExistUser = await prisma.user.findUnique({
      where: { id },
    });
    if (isExistUser) {
      return res.status(409).json({ errorMessage: '이미 존재하는 아이디입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 유저 생성
    await prisma.user.create({
      data: {
        id,
        password: hashedPassword,
      },
    });
    return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
  } catch (err) {
    return res.status(500).json({ errorMessage: '서버 내부 에러가 발생했습니다.' });
  }
});

// 로그인 API
router.post('/signIn', async (req, res, next) => {
  try {
    const { id: id, password } = req.body;

    if (!id || !password) {
      return res.status(401).json({ errorMessage: '입력 값이 잘못되었습니다.' });
    }

    // 유저 존재 유무 확인
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      return res.status(404).json({ errorMessage: '존재하지 않는 아이디입니다.' });
    }

    // 비밀번호 확인
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ errorMessage: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      {
        id,
      },
      configs.tokenSecretKey
    );

    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({
      message: '로그인이 완료되었습니다.',
    });
  } catch (err) {
    return res.status(500).json({ errorMessage: '서버 내부 에러가 발생했습니다.' });
  }
});

// 유저 검증 API
router.get('/auth', async (req, res, next) => {
  try {
    const { authorization } = req.cookies;

    if (!authorization) {
      throw new Error('유효하지 않은 인증입니다.');
    }

    const [tokenType, token] = authorization.split(' ');

    // 토큰 타입 확인
    if (tokenType !== 'Bearer') {
      throw new Error('토큰 타입이 일치하지 않습니다.');
    }

    const decodedToken = jwt.verify(token, configs.tokenSecretKey);
    const id = decodedToken.id;

    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      res.clearCookie('authorization');
      throw new Error('토큰 사용자가 존재하지 않습니다.');
    }

    return res.status(200).json({ message: '토큰 사용자 인증이 완료되었습니다.', data: { id } });
  } catch (err) {
    res.clearCookie('authorization');

    switch (err.name) {
      case 'JsonWebTokenError':
        return res.status(400).json({ errorMessage: '토큰이 잘못되었습니다.' });
      default:
        return res.status(400).json({ errorMessage: err.message ?? '비정상적인 요청입니다.' });
    }
  }
});

router.get('/ranking', async (req, res) =>{

  console.log("ranking");
  try {
    const ranking = await prisma.gameResultLog.findMany({
      orderBy: {
        score: 'desc',
      },
      take: 10,
    });
  
    console.log(ranking);

    const filterdRanking = ranking.map(info => ({
      id: info.id,
      score: info.score
    }));
  
    return res.status(200).json({ message: 'OK', filterdRanking: filterdRanking });
  } catch (err) {
    return res.status(500).json({ err: `server EEE ${err}`});
  }
})
export default router;
