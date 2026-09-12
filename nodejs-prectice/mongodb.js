
$eq   // equal
$ne   // not equal
$gt   // greater than
$gte  // greater than or equal
$lt   // less than
$lte  // less than or equal
$in   // value in array
$nin  // value not in array


$match
$project: Done
$group: Done
$sort: Done
$limit: Done
$skip
$lookup
$unwind
$facet
$addFields
$cond
$ifNull
$count
$setWindowFields

$and: Done
$or





// {
//   _id: ObjectId('697a06ac2fb696317fd8be9f'),
//   id: 50419,
//   account_id: '468267798861678',
//   account_name: 'Celestial Perfume',
//   campaign_id: '120229707429180009',
//   campaign_name: 'ds_adv_web_conv_top5_mix_creative_250925',
//   adset_id: '120229707429260009',
//   adset_name: 'adv_india_reel_250925',
//   ad_id: '120229707436380009',
//   ad_name: 'ds_im_perfumes_launch_vanshikha_mix_v1_reel_250925',
//   objective: 'OUTCOME_SALES',
//   reach: 1,
//   impressions: 1,
//   clicks: 0,
//   ctr: 0,
//   cpm: 40,
//   cpc: 'NULL',
//   spend: 0.04,
//   purchase_roas: 'NULL',
//   action_values: 'NULL',
//   updated_date: '01/12/2025',
//   created_at: '06:15.2',
//   created_date: '25/09/2025',
//   actions: 'NULL',
//   onsite_purchase_value: 0,
//   video_3s_plays: 0,
//   video_thruplays: 0,
//   link_clicks: 0,
//   meta_add_to_cart: 0,
//   outbound_clicks: 0,
//   initiated_checkout: 0
// }

db.orders.find({ account_name: "Celestial Perfume" })
db.orders.find({ spend: { $gt: 100 } }).count()
db.orders.find({ clicks: { $el: 0 } }).count()
db.orders.find({ $and: [{ objective: { $eq: 'OUTCOME_SALES' } }, { spend: { $gt: 50 } }] }).count()
db.orders.find({ cpc: { $ne: null } }).count()

db.orders.aggregate([
    {
        $group: {
            _id: "$campaign_name",
            totaladscampaignwise: { $sum: 1 }
        }
    }
])

db.orders.aggregate([
    {
        $group: {
            _id: "$campaign_name",
            totalSpend: { $sum: "$spend" }
        }
    }
])

console.table(
    db.orders.aggregate([
        {
            $group: {
                _id: '$campaign_name',
                totalSpend: { $sum: '$spend' }
            }
        },

        {
            $project: {
                _id: 1,
                totalSpend: { $round: ["$totalSpend", 4] }
            }
        },
        {
            $sort: { totalSpend: -1 }
        },
        {
            $skip: 9
        },
        {
            $limit: 10
        }
    ]).toArray())



console.table(
    db.orders.aggregate([
        {
            $group: { _id: "$campaign_name", averageofctr: { $avg: '$ctr' } }
        },
        {
            $project: { _id: 1, averageofctr: { $round: ["$averageofctr", 2] } }
        },
        {
            $sort: { averageofctr: -1 }
        },
        {
            $limit: 10
        }
    ]).toArray()
)



console.table(
    db.orders.aggregate([
        {
            $group: {
                _id: '$campaign_name',
                totalSpend: { $sum: '$spend' },
                totalClicks: { $sum: '$clicks' },
                totalImpressions: { $sum: '$impressions' },
                totalReach: { $sum: '$reach' }
            }
        },
        {
            $project: {
                _id: 1,
                "Total Spends": { $round: ["$totalSpend", 2] },
                "Total Clicks": { $round: ["$totalClicks", 2] },
                "Total Impressions": { $round: ["$totalImpressions", 2] },
                "Total Reach": { $round: ["$totalReach", 2] }
            }
        },
        {
            $sort: { "Total Spends": -1 }
        },
        {
            $limit: 20
        }

    ]).toArray()
)


console.table(
    db.orders.aggregate([
        {
            $group: {
                _id: '$campaign_name',
                aggregatespend: { $sum: '$spend' },
                aggregatclick: { $sum: '$clicks' }
            }
        },

        {
            $addFields: {
                calculatedCPC: {
                    $cond: {
                        if: { $eq: ['$aggregatclick', 0] },
                        then: 0,
                        else: {
                            $divide: ["$aggregatespend", "$aggregatclick"]

                        }

                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                aggregatespend: { $round: ["$aggregatespend", 1] },
                aggregatclick: { $round: ["$aggregatclick", 1] },
                calculatedCPC: { $round: ["$calculatedCPC", 2] }
            }
        },
        {
            $sort: { calculatedCPC: -1 }
        },
        {
            $limit: 15
        }
    ]).toArray()
)


console.table(
    db.orders.aggregate([
        {
            $match: {
                $and: [
                    { spend: { $gt: 100 } },
                    { clicks: { $eq: 0 } }
                ]
            }
        },
        {
            $group: {
                _id: "$campaign_name"
            }
        },
        {
            $project: {
                _id: 1
            }
        }
    ]).toArray()
)


console.table(

    db.orders.aggregate([
        {
            $group: { _id: '$updated_date', totalspend: { $sum: '$spend' } }
        },
        {
            $project: {
                _id: 1,
                "Date": "$updated_date"
            }
        },
        {
            $sort: { spend: -1 }
        },
        {
            $limit: 10
        }
    ]).toArray()
)


console.table(
    db.orders.aggregate([
        {
            $group: {
                _id: { campaign_name: "$campaign_name", ad_name: "$ad_name" },
                highspend: { $sum: '$spend' }
            }
        },
        {
            $project: {
                _id: 0,
                "Campaign Name": "$_id.campaign_name",
                "Ad Name": "$_id.ad_name",
                "Best Performing Ads": "$highspend"
            }
        },
        {
            $sort: { "Best Performing Ads": -1 }
        },
        {
            $limit: 10
        }
    ]).toArray()
)



console.table(
    db.orders.aggregate([
        { $match: { updated_date: { eq: '03-12-2025' } } },
        { $group: { _id: "$campaign_name", totalspend: { $sum: "$spend" } } },
        { $addFields: { grantotalspend: { $sum: "$spend" } } },
        {
            $project: {
                _id: 1,
                totalspend: 1,
                percentagecontribution: {
                    $multiply: [
                        { $divide: ['$totalspend', '$grantotalspend'] },
                        100
                    ]
                }
            }
        }
    ]).toArray()
)




console.table(
    db.orders.aggregate([
        { $match: { updated_date: { $eq: '03/12/2025' } } },
        { $group: { _id: "$campaign_name", totalspend: { $sum: "$spend" } } },
        {
            $group: {
                _id: null,
                grandtotalspend: { $sum: "$totalspend" },
                campaigns: { $push: { campaign_name: "$_id", totalspend: "$totalspend" } }
            }
        },
        { $unwind: "$campaigns" },
        {
            $project: {
                _id: "$campaigns.campaign_name",
                totalspend: { $round: ["$campaigns.totalspend", 2] },

                percentagecontribution: {
                    $round: [
                        {
                            $multiply: [
                                { $divide: ["$campaigns.totalspend", "$grandtotalspend"] },
                                100
                            ]
                        }, 2
                    ]
                }
            }
        },
        {
            $sort: { percentagecontribution: -1 }
        },
        {
            $limit: 10
        }
    ]).toArray()
)



console.table(
    db.orders.aggregate([
        { $group: { _id: '$campaign_name', campaignwisespend: { $sum: '$spend' } } },
        { $project: { _id: 1, abovecampaign: { $gt: ["$campaignwisespend", 10000] } } }
    ]).toArray()
)


console.table(
    db.meta_ad_insights.aggregate([
        { $group: { _id: '$campaign_name', campaignwisespend: { $sum: '$spend' } } },
        { $match: { campaignwisespend: { $gt: 10000 } } },
        { $project: { _id: 1, campaigns_total_spend: { $round: ["$campaignwisespend", 2] } } },
        { $sort: { "campaigns_total_spend": -1 } },
        { $limit: 10 }
    ]).toArray()
)


console.table(
    db.meta_ad_insights.aggregate([
        { $unwind: "$action_values" },
        {
            $match: {
                "action_values.action_type": "onsite_web_purchase"
            }
        },
        {
            $group: {
                _id: "$campaign_name",
                totalSpend: { $sum: "$spend" },
                conversionValue: {
                    $sum: { $toInt: "$action_values.value" }
                }
            }
        }
    ]).toArray()
);

[{ "value": "4445", "action_type": "onsite_web_app_purchase" }, { "value": "23274", "action_type": "onsite_web_app_add_to_cart" }, { "value": "13285", "action_type": "onsite_web_initiate_checkout" }, { "value": "10488", "action_type": "add_payment_info" }, { "value": "13285", "action_type": "omni_initiated_checkout" }, { "value": "51742", "action_type": "offsite_conversion.fb_pixel_view_content" }, { "value": "0.44", "action_type": "web_app_in_store_purchase" }, { "value": "51742", "action_type": "omni_view_content" }, { "value": "23274", "action_type": "add_to_cart" }, { "value": "4445", "action_type": "onsite_web_purchase" }, { "value": "23274", "action_type": "offsite_conversion.fb_pixel_add_to_cart" }, { "value": "4445", "action_type": "purchase" }, { "value": "51742", "action_type": "view_content" }, { "value": "13285", "action_type": "offsite_conversion.fb_pixel_initiate_checkout" }, { "value": "10488", "action_type": "offsite_conversion.fb_pixel_add_payment_info" }, { "value": "51742", "action_type": "onsite_web_view_content" }, { "value": "11637", "action_type": "offsite_conversion.fb_pixel_custom" }, { "value": "51742", "action_type": "onsite_web_app_view_content" }, { "value": "4445", "action_type": "offsite_conversion.fb_pixel_purchase" }, { "value": "13285", "action_type": "initiate_checkout" }, { "value": "23274", "action_type": "omni_add_to_cart" }, { "value": "4445", "action_type": "omni_purchase" }, { "value": "4445", "action_type": "web_in_store_purchase" }, { "value": "23274", "action_type": "onsite_web_add_to_cart" }, { "value": "8840", "action_type": "offsite_conversion.custom.680690311752185" }, { "value": "4445", "action_type": "offsite_conversion.custom.2045162196286394" }]

console.table(
    db.meta_ad_insights.aggregate([
        {
            $match: {
                action_values: /"action_type"\s*:\s*"onsite_web_purchase"/
            }
        },
        {
            $group: {
                _id: "$campaign_name",
                totalSpend: { $sum: "$spend" }
            }
        }
    ]).toArray()
)



// 17-JUNE-2026

// Q1. Find the top 3 ads by ROAS across all accounts. Exclude ads that have 'NULL' as ROAS or zero spend. Show: ad name, account, format extracted from ad_name, spend, revenue, ROAS.

console.table(
    db.ads_performance.aggregate([
        {
            $match: {
                purchase_roas: { $ne: "NULL" },
                spend: { $gt: 0 }
            }
        },
        {
            $addFields: {
                format: {
                    $switch: {
                        branches: [
                            { case: { $regexMatch: { input: "$ad_name", regex: /_reel/ } }, then: "reel" },
                            { case: { $regexMatch: { input: "$ad_name", regex: /_image/ } }, then: "image" },
                            { case: { $regexMatch: { input: "$ad_name", regex: /_video/ } }, then: "video" },
                            { case: { $regexMatch: { input: "$ad_name", regex: /_carousel/ } }, then: "carousel" },
                        ],
                        default: "other"
                    }
                }
            }

        },
        {
            $project: {
                _id: 0,
                account_name: 1,
                ad_name: 1,
                format: 1,
                spend: 1,
                revenue: 1,
                purchase_roas: 1,
                onsite_purchase_value: 1
            }
        },
        { $sort: { purchase_roas: -1 } },
        { $limit: 3 }
    ]).toArray()
)


db.ads_performance.aggregate([
    {
        $group: {

        }
    }
])


// 2. Business Question For each account, calculate the complete conversion funnel rates:

// Impressions → Link Clicks (CTR)
// Link Clicks → Add to Cart
// Add to Cart → Initiated Checkout
// Initiated Checkout → Purchase

// Handle division by zero. Identify which account has the best end-to-end conversion (impression → purchase).

console.table(

    db.ads_performance.aggregate([
        {
            $group: {
                _id: "$account_name",
                total_impressions: { $sum: "$impressions" },
                total_link_clicks: { $sum: "$link_clicks" },
                total_addtocart: { $sum: "$meta_add_to_cart" },
                total_checkout: { $sum: "$initiated_checkout" },
                total_revenue: { $sum: "$onsite_purchase_value" },
                total_spend: { $sum: { $round: ["$spend", 2] } },
                purchase_count: {
                    $sum: {
                        $cond: {
                            if: { $gt: ["$onsite_purchase_value", 0] },
                            then: 1,
                            else: 0
                        }
                    }
                }
            }
        },
        {
            $addFields: {
                ctr_pct: {
                    $cond: {
                        if: { $eq: ["$total_impressions", 0] },
                        then: 0,
                        else: { $round: [{ $multiply: [{ $divide: ["$total_link_clicks", "$total_impressions"] }, 100] }, 2] }
                    }
                },
                click_to_atc_pct: {
                    $cond: {
                        if: { $eq: ["$total_link_clicks", 0] },
                        then: 0,
                        else: { $round: [{ $multiply: [{ $divide: ["$total_addtocart", "$total_link_clicks"] }, 100] }, 2] }
                    }
                },
                atc_to_checkout_pct: {
                    $cond: {
                        if: { $eq: ["$total_addtocart", 0] },
                        then: 0,
                        else: { $round: [{ $multiply: [{ $divide: ["$total_checkout", "$total_addtocart"] }, 100] }, 2] }
                    }
                },
                checkout_to_purchase_pct: {
                    $cond: {
                        if: { $eq: ['$total_checkout', 0] },
                        then: 0,
                        else: { $round: [{ $multiply: [{ $divide: ["$purchase_count", "$total_checkout"] }, 100] }, 2] }
                    }
                },
                end_to_end_conversion_pct: {
                    $cond: {
                        if: { $eq: ["$total_impressions", 0] },
                        then: 0,
                        else: { $round: [{ $multiply: [{ $divide: ["$purchase_count", "$total_impressions"] }, 100] }, 2] }
                    }
                }
            }

        },
        {
            $project: {
                _id: 1,
                ctr_pct: 1,
                click_to_atc_pct: 1,
                atc_to_checkout_pct: 1,
                checkout_to_purchase_pct: 1,
                end_to_end_conversion_pct: 1,
                total_revenue: 1,
                total_spend: 1,

            }
        }
    ]).toArray()

)


// 3. Business Question
// Extract the creative format from each ad_name (reel, carousel, static, video, image, ugc). For each format, calculate:

// Total spend
// Total revenue
// Average ROAS
// Best account using that format   

db.ads_performance.aggregate([
    {
        
    }
])