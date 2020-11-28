const DiscordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const DiscordUser = require('../models/DiscordUser');

passport.serializeUser((user, done) => {
    done(null, user.id)
});
passport.deserializeUser(async (id, done) => {
    const user = await DiscordUser.findById(id);
    if (user)
        done(null, user);
});

passport.use(new DiscordStrategy({
    clientID: require("./../../config.json").clientID,
    clientSecret: require("./../../config.json").clientSecret,
    callbackURL: require("./../../config.json").callbackURL,
    scope: require("./../../config.json").scope
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await DiscordUser.findOne({
            discordId: profile.id
        });
        if (user) {
            require("@greencoast/logger").info(`${profile.username}#${profile.discriminator} || (${profile.id}) logged into dashboard.`);
            await user.updateOne({
                username: `${profile.username}#${profile.discriminator}`,
                guilds: profile.guilds,
                email: profile.email
            });
            done(null, user);
        } else {
            require("@greencoast/logger").info(`${profile.username}#${profile.discriminator} || (${profile.id}) Didn't exist so added them, and I logged them into dashboard.`);
            const newUser = await DiscordUser.create({
                discordId: profile.id,
                username: profile.username,
                guilds: profile.guilds,
                email: profile.email
            });
            const savedUser = await newUser.save();
            done(null, savedUser);
        }
    } catch (err) {
        require("@greencoast/logger").error(err);
        done(err, null);
    }
}));