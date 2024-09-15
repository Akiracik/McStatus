const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const util = require('minecraft-server-util');
const config = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mcstatus')
        .setDescription('Minecraft sunucusunun durumunu gösterir'),
    async execute(interaction) {
        await interaction.deferReply();

        try {
            const result = await util.status(config.minecraft.ip, config.minecraft.port);
            
            const onlineStatus = result.players.online > 0 ? '🟢 Çevrimiçi' : '🟡 Boş';
            
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🏠AkiCode McStatus Botu')
                .addFields(
                    { name: '🌐 IP', value: `\`${config.minecraft.ip}:${config.minecraft.port}\``, inline: false },
                    { name: '👥 Oyuncular', value: `${result.players.online}/${result.players.max}`, inline: true },
                    { name: '🎮 Sürüm', value: result.version.name, inline: true },
                    { name: '📊 Durum', value: onlineStatus, inline: true },
                    { name: '📝 MOTD', value: result.motd.clean || 'Bilgi yok', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'AkiCode McStatus 🔄 Son güncelleme' });

            if (result.favicon) {
                embed.setThumbnail(`attachment://server-icon.png`);
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('📞 Destek Sunucusu')
                        .setStyle(ButtonStyle.Link)
                        .setURL('https://discord.com/invite/6SbCcgBRh8'),
                    new ButtonBuilder()
                        .setLabel('🔄 Yenile')
                        .setStyle(ButtonStyle.Primary)
                        .setCustomId('refresh_status')
                );

            const reply = { embeds: [embed], components: [row] };
            if (result.favicon) {
                const iconBuffer = Buffer.from(result.favicon.split(',')[1], 'base64');
                reply.files = [{ attachment: iconBuffer, name: 'server-icon.png' }];
            }

            await interaction.editReply(reply);
        } catch (error) {
            console.error('Sunucu durumu alınamadı:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Sunucu Durumu Hatası')
                .setDescription('Sunucu durumu alınamadı. Sunucu çevrimdışı olabilir veya bir hata oluştu.')
                .setTimestamp()
                .setFooter({ text: '🔄 Son deneme' });

            await interaction.editReply({ embeds: [errorEmbed], components: [] });
        }
    },
};