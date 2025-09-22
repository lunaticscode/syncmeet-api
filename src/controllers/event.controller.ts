const createEventController: AppController = (req, res) => {
  const body = req.body;
  console.log(body);
  return res.json({ isError: false });
};

export { createEventController };
