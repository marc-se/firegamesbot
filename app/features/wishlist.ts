import { isAuthorizedUser } from "../utils/isAuthorizedUser";
import { fetchWishlist } from "../net/fetchWishlist";

const getWishlsit = (ctx: any) => {
  const userId = ctx.message.from.id.toString();

  fetchWishlist()
    .then((wishlist) => {
      if (wishlist) {
        const replyMessage = wishlist.map(
          (game) => `- ${game.title} (${game.system} | ${game.region})\n`
        );
        if (isAuthorizedUser(userId)) {
          ctx.replyWithMarkdown(`*Wishlist 🎁:*${replyMessage}`);
        }
      }
    })
    .catch((error) => console.error("Wishlist Error", error));
};

const wishlist = (bot: any) => {
  bot.command("/wishlist", (ctx: any) => getWishlsit(ctx));
  bot.hears(/wishlist/gim, (ctx: any) => getWishlsit(ctx));
};

export default wishlist;
