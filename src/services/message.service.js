import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";
import { sendInformMessage } from "../utils/nodemailer.js";

const messageService = {
    async createOne(message, auction) {
        message.created_at = new Date();

        const seller = await userModel.findById(auction.seller_id);

        const newMessage = await messageModel.createOne(message);
        const { info } = await sendInformMessage(seller.email, auction);

        return newMessage;
    },


    async getAllMessageByAuctionId(auction_id) {
        const messages =
            await messageModel.getAllByAuctionId(auction_id);

        await Promise.all(
            messages.map(async (message) => {
                const replyMessages = await messageModel.getMessageLevel2(message.id);
                message.replyMessages = replyMessages;
            })
        );

        return messages;
    }
};

export default messageService;