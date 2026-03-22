import { PrismaClient } from '@@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Limpiar tablas existentes (en orden inverso de dependencias)
  await prisma.matchPlayerRank.deleteMany().catch(() => {})
  await prisma.summonerMatchlist.deleteMany().catch(() => {})
  await prisma.matchPlayer.deleteMany().catch(() => {})
  await prisma.matchTeam.deleteMany().catch(() => {})
  await prisma.match.deleteMany().catch(() => {})
  await prisma.summonerName.deleteMany().catch(() => {})
  await prisma.summoner.deleteMany().catch(() => {})

  console.log('Cleaned existing data')

  // Crear summoners de ejemplo
  const summoner1 = await prisma.summoner.create({
    data: {
      puuid: 'test-puuid-001-1234-5678-123456789012',
      gameName: 'TestSummon',
      tagLine: 'EXE',
      summonerLevel: 500,
      profileIconId: 1,
      revisionDate: new Date('2024-01-01'),
      region: 'euw',
      lastUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  const summoner2 = await prisma.summoner.create({
    data: {
      puuid: 'test-puuid-002-1234-5678-123456789012',
      gameName: 'AnotherTest',
      tagLine: 'LOL',
      summonerLevel: 250,
      profileIconId: 2,
      revisionDate: new Date('2024-01-01'),
      region: 'na',
      lastUpdatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })

  console.log('Created summoners:', summoner1.gameName, summoner2.gameName)

  // Crear historial de nombres
  await prisma.summonerName.create({
    data: {
      summonerPuuid: summoner1.puuid,
      gameName: 'OldSummonerName',
      previousNick: 'OldSummonerName',
    },
  })

  // Crear match de ejemplo
  const match = await prisma.match.create({
    data: {
      matchId: 'EUW_1234567890',
      dataVersion: '2',
      metadata: { info: { participants: [] } },
      gameCreation: new Date(),
      gameDuration: 1800, // 30 minutos
      gameMode: 'CLASSIC',
      gameType: 'MATCHED_GAME',
      queueId: 420, // Ranked Solo/Duo
      mapId: 11, // Summoner's Rift
      patch: '14.1.1',
      season: 14,
      region: 'euw',
    },
  })

  console.log('Created match:', match.matchId)

  // Crear equipos
  const teamBlue = await prisma.matchTeam.create({
    data: {
      matchId: match.matchId,
      teamId: 100,
      win: true,
      towerKills: 8,
      inhibitorKills: 1,
      baronKills: 1,
      dragonKills: 3,
      riftHeraldKills: 1,
      elderDragonKills: 0,
      bans: [1, 2, 3, 4, 5],
    },
  })

  const teamRed = await prisma.matchTeam.create({
    data: {
      matchId: match.matchId,
      teamId: 200,
      win: false,
      towerKills: 4,
      inhibitorKills: 0,
      baronKills: 0,
      dragonKills: 1,
      riftHeraldKills: 0,
      elderDragonKills: 0,
      bans: [6, 7, 8, 9, 10],
    },
  })

  console.log('Created teams:', teamBlue.teamId, teamRed.teamId)

  // Crear jugadores en el match
  const player1 = await prisma.matchPlayer.create({
    data: {
      matchId: match.matchId,
      summonerPuuid: summoner1.puuid,
      puuid: summoner1.puuid,
      summonerName: summoner1.gameName,
      teamId: 100,
      championId: 1, // Annie
      championName: 'Annie',
      championLevel: 16,
      win: true,
      kills: 10,
      deaths: 2,
      assists: 8,
      kda: 9.0,
      kp: 0.75,
      cs: 200,
      csPerMinute: 6.7,
      goldEarned: 15000,
      goldPerMinute: 500,
      goldSpent: 14000,
      totalDamageDealt: 50000,
      totalDamageDealtToChampions: 25000,
      totalDamageTaken: 20000,
      turretKills: 2,
      dragonKills: 2,
      baronKills: 1,
      visionScore: 25,
      wardsPlaced: 12,
      wardsKilled: 5,
      spell1Id: 4, // Flash
      spell2Id: 14, // Ignite
      teamPosition: 'MIDDLE',
      item0: 3020, // Sorcerer's Shoes
      item1: 6655, // Luden's Tempest
      item2: 3089, // Rabadon's Deathcap
      item3: 3135, // Void Staff
      item4: 3157, // Zhonya's Hourglass
      item5: 3116, // Rylai's Crystal Scepter
      item6: 3363, // Farsight Alteration
      primaryRunePath: 8100, // Domination
      perk0: 8112, // Electrocute
      secondaryRunePath: 8200, // Sorcery
    },
  })

  const player2 = await prisma.matchPlayer.create({
    data: {
      matchId: match.matchId,
      summonerPuuid: summoner2.puuid,
      puuid: summoner2.puuid,
      summonerName: summoner2.gameName,
      teamId: 200,
      championId: 2, // Olaf
      championName: 'Olaf',
      championLevel: 15,
      win: false,
      kills: 3,
      deaths: 10,
      assists: 5,
      kda: 0.8,
      kp: 0.5,
      cs: 180,
      csPerMinute: 6.0,
      goldEarned: 10000,
      goldPerMinute: 333,
      goldSpent: 9500,
      totalDamageDealt: 30000,
      totalDamageDealtToChampions: 15000,
      totalDamageTaken: 35000,
      turretKills: 1,
      dragonKills: 0,
      baronKills: 0,
      visionScore: 15,
      wardsPlaced: 8,
      wardsKilled: 3,
      spell1Id: 4, // Flash
      spell2Id: 11, // Smite
      teamPosition: 'JUNGLE',
    },
  })

  console.log('Created players:', player1.summonerName, player2.summonerName)

  // Crear registro en matchlist
  await prisma.summonerMatchlist.create({
    data: {
      summonerPuuid: summoner1.puuid,
      matchId: match.matchId,
      season: 14,
    },
  })

  // Crear rank para el jugador
  await prisma.matchPlayerRank.create({
    data: {
      matchId: player1.id,
      playerPuuid: player1.puuid,
      queueType: 'RANKED_SOLO_5x5',
      tier: 'PLATINUM',
      rank: 'II',
      leaguePoints: 75,
      wins: 100,
      losses: 80,
    },
  })

  console.log('Created match player rank')

  console.log('')
  console.log('Seeding completed!')
  console.log('- 2 summoners created')
  console.log('- 1 match created')
  console.log('- 2 teams created')
  console.log('- 2 players created')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
