import * as fs from 'fs/promises'
import * as path from 'path'
import {Client} from 'discord.js'

const PROFANITIES_PATH = path.join(`${path.resolve()}/profanities.txt`)
const REPLACE_WORDS_PATH = path.join(`${path.resolve()}/replacementWords.txt`)
let profanitiesList = await loadProfanities()
let replaceWordsList = await loadReplacementWords()

// can manage messages and add reactions
const client = new Client({intents: ['GUILDS', 'GUILD_MESSAGES']})

// the bot token is taken from an environment variable
client.login(process.env['DISCORD_TOKEN'])

client.on('ready', function(){
    console.log(`${client.user.tag} is running`);

})

client.on('messageCreate', async function(message){
    if(message.author.bot){
        return
    }

    if(message.content[0] === `$`){
        await commands(message)
        return
    }

    await profanityFilter(message)
})


// *******************************
// functions

async function profanityFilter(message){
    let newContent = message.content
    let hasProfanity = false
    for(const regex of profanitiesList){
        let re = new RegExp(regex)
        if(newContent.match(re)){
            hasProfanity = true
            re = new RegExp(regex, 'g')
            const replaceIndex = Math.floor(Math.random()*replaceWordsList.length)
            newContent = newContent.replace(re, replaceWordsList[replaceIndex])
        }
    }
    
    if(hasProfanity){
        newContent = `<@${message.author.id}> meant to say:\n${newContent}`
        await message.reply(newContent)
        try{
            await message.delete()
        }
        catch (e){
            console.log(e);
        }
    }
}

async function commands(message){
    // the command prefix is $
    const COMMANDS_TYPES = {
        general: ['help'],
        admin: ['add-profanity', 'remove-profanity', 'list-profanity', 
            'add-replacement', 'remove-replacement', 'list-replacement'],
        user: []
    }

    const args = message.content.split(' ')
    
    if(args[0] === `$help`){
        await helpCommand(COMMANDS_TYPES, args, message)
        return
    }

    if(args[0] === `$add-profanity` || args[0] === `$add-replacement`){
        await addProfanityCommand(args, message)
        return
    }

}

async function helpCommand(COMMANDS_TYPES, args, message){
    if(args.length === 1){
        const cmdStr = Object.keys(COMMANDS_TYPES).join('\n')
        await message.reply(`type \`$help option\` for more information. The options are:\n\`${cmdStr}\``)
        return
    }

    for(const option of Object.keys(COMMANDS_TYPES)){
        if(args[1] === option){
            const cmdStr = COMMANDS_TYPES[option].join('\n')
            await message.reply(`the available commands for ${option} are:\n\`${cmdStr}\``)
            return
        }
    }
}

async function addProfanityCommand(args, message){
    const newWord = args.slice(1).join(' ')
    if(args[0] === `$add-profanity`){
        await fs.appendFile(PROFANITIES_PATH, newWord)
        profanitiesList = await loadProfanities()
    }
    else if(args[0] === `$add-replacement`){
        await fs.appendFile(REPLACE_WORDS_PATH, newWord)
        replaceWordsList = await loadReplacementWords()
    }
}


async function loadProfanities(){
    const profanitiesList = (await fs.readFile(PROFANITIES_PATH, 'utf-8')).split(/\r?\n/)
    cleanEmptyLines(profanitiesList)
    return profanitiesList
}

async function loadReplacementWords(){
    const replaceWordsList = (await fs.readFile(REPLACE_WORDS_PATH, 'utf-8')).split(/\r?\n/)
    cleanEmptyLines(replaceWordsList)
    return replaceWordsList
}

function cleanEmptyLines(wordList){
    for(const index in wordList){
        if(wordList[index].match(/^ *$/)){
            wordList.splice(index,1)
            return cleanEmptyLines(wordList)
        }
    }
    return
}


