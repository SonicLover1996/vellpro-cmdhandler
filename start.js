const config = require("./config.json");
const package = require("./package.json");
const Discord = require('discord.js');
const sql = require("sqlite");
sql.open("./score.sqlite");
const fs = require("fs");
const figlet = require('figlet');
const prefix = config.prefix;
const inv = new Discord.Client();
inv.commands = new Discord.Collection();
inv.aliases = new Discord.Collection();
inv.playlists = new Discord.Collection();
//Logs of readyness
const responseObject = {
    "ayy": "Ayy, lmao!",
    "wat": "Say what?",
    "lol": "lol indeed",
    "odii": "is nub"
};
inv.on('ready', () => {
    inv.user.setActivity("?help", {
        type: "STREAMING",
        url: "https://twitch.tv/vellpro"
    })


    figlet('GD', function(err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data)
        console.log("")
        console.log("")
        console.log("Core by")
        figlet('Alphi', function(err, data) {
            if (err) {
                console.log('Something went wrong...');
                console.dir(err);
                return;
            }
            console.log(data)
            figlet('==========', function(err, data) {
                if (err) {
                    console.log('Something went wrong...');
                    console.dir(err);
                    return;
                }
                console.log(data)
            });
        });
    });
});


//cmd handler
fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        let eventFunction = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        inv.on(eventName, (...args) => eventFunction.run(inv, ...args));
    });
});

inv.on("message", message => {
    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    try {
        if (message.channel.type === "dm") {
            let embed1 = new Discord.RichEmbed() //info embed on ticket
                .setTitle("Error :x:")
                .setColor("db1212")
                .setDescription("DM Commands are not allowed!")
                .setFooter(`Version ` + package.version)
            message.channel.send(embed1)
            return;
        }

        const responseObject = {
            "ayy": "Ayy, lmao!",
            "wat": "Say what?",
            "lol": "lol indeed",
            "odii": "is nub"
        };
        let commandFile = require(`./commands/${command}.js`);
        commandFile.run(inv, message, args);
    } catch (err) {

        console.error(err);
    }
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
        if (!row) {
            sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
        } else {
            let curLevel = Math.floor(0.1 * Math.sqrt(row.points + 1));
            if (curLevel > row.level) {
                row.level = curLevel;
                sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
                message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
            }
            sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
        }
    }).catch(() => {
        console.error;
        sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
            sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
        });
    });

    if (!message.content.startsWith(prefix)) return;

    if (message.content.startsWith(prefix + "level")) {
        sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
            if (!row) return message.reply("Your current level is 0");
            message.reply(`Your current level is ${row.level}`);
        });
    } else

    if (message.content.startsWith(prefix + "points")) {
        sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
            if (!row) return message.reply("Sadly you do not have any points yet! :slight_frown:");
            message.reply(`You currently have ${row.points} points, good going!`);
        });
    }

    if (responseObject[message.content]) {
        message.channel.send(responseObject[message.content]);
    }

});



inv.login(config.token);