import { prisma } from "./prisma.js";

export async function findOrCreateChat(senderId, receiverId) {
  // First try to find existing chat
  let chat = await prisma.chat.findFirst({
    where: {
      OR: [
        {
          AND: [
            { userId: senderId },
            {
              messages: {
                some: {
                  OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                  ],
                },
              },
            },
          ],
        },
        {
          AND: [
            { userId: receiverId },
            {
              messages: {
                some: {
                  OR: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId },
                  ],
                },
              },
            },
          ],
        },
      ],
    },
  });

  // If no chat exists, create a new one
  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        userId: senderId,
      },
    });
    console.log("Created new chat:", chat.id);
  }

  return chat;
}

export async function createMessage({ content, senderId, receiverId, chatId }) {
  return prisma.message.create({
    data: {
      content,
      senderId,
      receiverId,
      chatId,
      read: false,
    },
    include: {  // Fixed 'included' to 'include'
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
}