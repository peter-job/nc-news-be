exports.createRef = (data, nameField, idField) => data.reduce((dict, row) => {
  dict[row[nameField]] = row[idField];
  return dict;
}, {});

exports.formateDate = timestamp => new Date(timestamp);
