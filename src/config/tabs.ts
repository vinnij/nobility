const tabsData = [
    {
        tab_key: "pvp_stats",
        tab_label: "PVP",
        columns: [
            { column_key: "kills", column_label: "Kills" },
            { column_key: "deaths", column_label: "Deaths" },
            { column_key: "kd_ratio", column_label: "KDR" },
            { column_key: "headshots", column_label: "Headshots" },
            { column_key: "bullets_hit", column_label: "Bullets Hit" },
            { column_key: "suicides", column_label: "Suicides" },
            { column_key: "wounds", column_label: "Wounds" },
            { column_key: "bullets_fired", column_label: "Bullets Fired" },
        ],
    },
    {
        tab_key: "resources_stats",
        tab_label: "Resources",
        columns: [
            { column_key: "wood_collected", column_label: "Wood Collected" },
            { column_key: "stone_collected", column_label: "Stone Collected" },
            { column_key: "metal_collected", column_label: "Metal Collected" },
            { column_key: "sulfur_collected", column_label: "Sulfur Collected" },
            { column_key: "leather", column_label: "Leather" },
            { column_key: "bones", column_label: "Bones" },
            { column_key: "hq_metal_ore", column_label: "HQ Metal Ore" },
            { column_key: "animal_fat", column_label: "Animal Fat" },
        ],
    },
    {
        tab_key: "explosives_stats",
        tab_label: "Explosives",
        columns: [
            { column_key: "c4_used", column_label: "C4 Used" },
            { column_key: "rockets_used", column_label: "Rockets Used" },
            { column_key: "grenades_used", column_label: "Grenades Used" },
            { column_key: "satches_thrown", column_label: "Satchels Thrown" },
        ],
    },
    {
        tab_key: "farming_stats",
        tab_label: "Farming",
        columns: [
            { column_key: "corn", column_label: "Corn" },
            { column_key: "potatoes", column_label: "Potatoes" },
            { column_key: "pumpkins", column_label: "Pumpkins" },
            { column_key: "watermelon", column_label: "Watermelon" },
            { column_key: "carrots", column_label: "Carrots" },
            { column_key: "rice", column_label: "Rice" },
            { column_key: "mushrooms", column_label: "Mushrooms" },
            { column_key: "berries", column_label: "Berries" },
            { column_key: "beans", column_label: "Beans" },
            { column_key: "leather_harvested", column_label: "Leather Harvested" },
        ],
    },
    {
        tab_key: "misc_stats",
        tab_label: "Misc",
        columns: [
            { column_key: "boats_destroyed", column_label: "Boats Destroyed" },
            { column_key: "subs_destroyed", column_label: "Subs Destroyed" },
            { column_key: "time_played", column_label: "Time Played (Minutes)" },
            { column_key: "time_swimming", column_label: "Time Swimming (Minutes)" },
            { column_key: "missions_completed", column_label: "Missions Completed" },
            { column_key: "items_dropped", column_label: "Items Dropped" },
            { column_key: "missions_started", column_label: "Missions Started" },
        ],
    },
]

export default tabsData;