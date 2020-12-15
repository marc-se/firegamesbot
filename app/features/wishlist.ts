import { isAuthorizedUser } from "../utils/isAuthorizedUser";
import { fetchWishlist } from "../net/fetchWishlist";
import type { WishlistItem } from "../types";

const sendReplyMessage = (
  ctx: any,
  gameArray: WishlistItem[],
  withTitle: boolean = true
) => {
  let replyMessage = "";
  gameArray.map((game) => {
    if (!game.purchased) {
      replyMessage = `${replyMessage}\n- ${game.title} (${game.region})`;
    }
  });
  if (withTitle) {
    ctx.replyWithMarkdown(`*Wishlist 🎁:*${replyMessage}`);
    return;
  }
  ctx.replyWithMarkdown(`${replyMessage}`);
};

const getWishlist = (ctx: any) => {
  const userId = ctx.message.from.id.toString();

  if (isAuthorizedUser(userId)) {
    fetchWishlist()
      .then((wishlist) => {
        if (wishlist) {
          if (wishlist.length > 60) {
            const half = Math.ceil(wishlist.length / 2);
            const firstHalf = wishlist.splice(0, half);
            sendReplyMessage(ctx, firstHalf);
            const secondHalf = wishlist.splice(-half);
            sendReplyMessage(ctx, secondHalf, false);
            return;
          }

          sendReplyMessage(ctx, wishlist);
        }
      })
      .catch((error) => console.error("Wishlist Error", error));
  }
};

const wishlist = (bot: any) => {
  bot.command("/wishlist", (ctx: any) => getWishlist(ctx));
  bot.hears(/wishlist/gim, (ctx: any) => getWishlist(ctx));
};

export default wishlist;
