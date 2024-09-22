const Item = require('../models/itemModel');
const Option = require('../models/optionModel');
const catchAsync = require('../utils/catchAsync');

exports.updateCategories = catchAsync(async () => {
  const categories = await Item.distinct('category');
  const lowerCaseCategories = categories.map((category) => category.toLowerCase());
  const uniqueCategories = [...new Set(lowerCaseCategories)];
  const option = await Option.findOne(); // Assuming there's only one options document

  if (option) {
    const existingCategories = option.category.reduce((acc, cat) => {
      acc[cat.name] = cat.photo;
      return acc;
    }, {});

    const updatedCategories = uniqueCategories.map((name) => ({
      name,
      photo: existingCategories[name] || '', // Retain existing photo or set to empty string
    }));

    option.category = updatedCategories;
    await option.save();
  } else {
    await Option.create({
      category: uniqueCategories.map((name) => ({ name, photo: '' })),
    });
  }
});
