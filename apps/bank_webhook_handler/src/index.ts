import express from "express";
import db from "@repo/db/client";
const app = express();

app.post("/webhook", async (req, res) => {
  try {
    //TODO ADD ZOD VALIDATION HERE
    const paymentInformation = {
      token: req.body.token,
      amount: req.body.amount,
      currency: req.body.currency,
      status: req.body.status,
      userId: req.body.userId,
    };

    await db.$transaction([
      db.balance.update({
        where: {
          userId: paymentInformation.userId,
        },
        data: {
          amount: {
            increment: paymentInformation.amount,
          },
        },
      }),
      db.onRampTransaction.update({
        where: {
          token: paymentInformation.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

    res.status(200).json({ message: "captured" });
  } catch (e) {
    console.error(e);
    res.status(411).json({
      message: "Error while processing webhook",
    });
  }
});

app.listen(3003);
