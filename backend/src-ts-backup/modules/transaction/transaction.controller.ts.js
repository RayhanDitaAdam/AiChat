import * as transactionService from "./transaction.service.js";

export const createTransaction = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const data = await transactionService.createTransaction(req.body, user.id);
    res.status(201).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const user = req.user;
    const effectiveStoreId = user?.ownerId || user?.memberOfId;

    if (!user || !effectiveStoreId)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const contributorId = user.role === "CONTRIBUTOR" ? user.id : undefined;
    const { startDate, endDate, memberId } = req.query;

    const data = await transactionService.getTransactions({
      ownerId: effectiveStoreId,
      startDate: startDate,
      endDate: endDate,
      memberId: memberId,
      contributorId,
    });
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await transactionService.getTransactionById(id);
    if (!data)
      return res
        .status(404)
        .json({ status: "error", message: "Transaction not found" });
    res.status(200).json({ status: "success", data });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
