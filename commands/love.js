exports.run = (inv, message, args) => {
message.react("❤")
const special_users = ["337343219128074240", "397150181184897027"];
const mentions = message.mentions.users;
let special = false;
special_users.forEach((id) => mentions.has(id), special = true);
const percent = special ? 100 : Math.floor(Math.random()*100);
if (mentions.size === 2) message.channel.send(`${mentions.array()[0].username} and ${mentions.array()[1].username} have a ${percent}% love connection.`);
else message.channel.send(`Please mention (2) people.`);
}
