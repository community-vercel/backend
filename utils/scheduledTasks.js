// const ToDo = require('../models/Todo');

// const updateOverdueTodos = async () => {
//   try {
//     const result = await ToDo.updateMany(
//       {
//         status: 'pending',
//         dueDate: { $lt: new Date() }
//       },
//       {
//         $set: { status: 'late' }
//       }
//     );

//     if (result.modifiedCount > 0) {
//       console.log(` Updated ${result.modifiedCount} overdue todos to 'late' status`);
//     }
//   } catch (error) {
//     console.error(' Error updating overdue todos:', error);
//   }
// };

// module.exports = { updateOverdueTodos };
