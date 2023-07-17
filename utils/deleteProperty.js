const deleteProperty = (data, property) => {
  const updatedUser = JSON.parse(JSON.stringify(data));
  property.forEach((e) => {
    delete updatedUser[e];
  });
  return updatedUser;
};

module.exports = deleteProperty;
