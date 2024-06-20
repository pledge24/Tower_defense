import { prisma } from '../utils/prisma/index.js';

const userScoreInfo = {};

// 게임 시작 시 몬스터 기록 초기화
export const initializeScore = (userId) => {
  
  userScoreInfo[userId] = 0;
  console.log(`initializeScore: ${JSON.stringify(userScoreInfo)}`);
};

// 해당 유저 점수 조회
export const getScore = (userId) => {
  if(!userId) return userScoreInfo;
  return userScoreInfo[userId];
};

// 해당 유저 점수 설정
export const setScore = (userId, score) => {
  
  userScoreInfo[userId] = score;
  // console.log(`setScore: ${userScoreInfo}`);
};

// 해당 유저 점수 추가
export const addScore = (userId, score) => {
  userScoreInfo[userId] += score;
  // console.log(`userScoreInfo >> userId : ${userId}, Current Score: ${userScoreInfo[userId]}`);
};

// 해당 유저 점수 추가
export const removeScore = (userId) => {
  delete userScoreInfo[userId];
};


// 최고 점수 조회
export const getHighScore = async (userId) => {
  const user = await prisma.gameResultLog.findFirst({
    where: {
      id: userId,
    },
    orderBy: {
      score: 'desc',
    },
  });

  if (!user) {
    return null;
  }

  return user.score;
};

// 게임 결과 이력 추가
export const addGameResult = async (userId, data) => {
  const gameResult = await prisma.gameResultLog.create({
    data: {
      id: userId,
      score: data.score,
      timestamp: data.timestamp,
    },
  });
};

// 게임 결과 이력 조회
export const getGameResults = async (userId, take = 10) => {
  const gameResults = await prisma.gameResultLog.findMany({
    data: {
      score: true,
      timestamp: true,
    },
    where: {
      id: userId,
    },
    orderBy: {
      timestamp: 'desc',
    },

    take,
  });

  return gameResults;
};

// 랭킹 조회
export const getranking = async (take = 10) => {
  const ranking = await prisma.gameResultLog.findMany({
    orderBy: {
      score: 'desc',
    },
    take,
  });

  const filterdRanking = ranking.map(info => ({
    id: info.id,
    score: info.score
  }));

  return filterdRanking;
};
