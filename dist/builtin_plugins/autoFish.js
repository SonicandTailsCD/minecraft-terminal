"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.name = void 0;
exports.name = 'Auto Fish';
const main = (mcterm) => {
    const fish = async () => {
        if (nowFishing) {
            mcterm.warn('Already fishing');
            return;
        }
        try {
            await mcterm.bot.equip(mcterm.pRegistry.itemsByName.fishing_rod.id, 'hand');
        }
        catch {
            mcterm.warn('I don\'t have any fishing rods!');
            return;
        }
        nowFishing = true;
        mcterm.bot.on('playerCollect', onCollect);
        try {
            await mcterm.bot.fish();
        }
        catch (err) {
            mcterm.error(err.message);
        }
        nowFishing = false;
    };
    mcterm.info('Added \'.fish\', \'.stopfish\' and \'.caughtfish\' commands');
    let caughtFish = 0;
    const onCollect = (collector, collected) => {
        if (collected.kind === 'Drops' && collector === mcterm.bot.entity) {
            mcterm.bot.removeListener('playerCollect', onCollect);
            caughtFish++;
            mcterm.success(`Caught a fish! I've caught ${caughtFish} fish so far`);
            void fish();
        }
    };
    let nowFishing = false;
    mcterm.commands.commands.caughtFish = () => {
        mcterm.info(`Caught fish: ${caughtFish}`);
    };
    mcterm.commands.commands.fish = async () => {
        mcterm.info('Started fishing');
        await fish();
    };
    mcterm.commands.commands.stopfish = () => {
        mcterm.success('Stopped fishing');
        if (!nowFishing)
            return;
        mcterm.bot.removeListener('playerCollect', onCollect);
        mcterm.bot.activateItem();
    };
};
exports.main = main;
