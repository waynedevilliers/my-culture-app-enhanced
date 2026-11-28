const breakpoints = [3840, 1920, 1080, 640, 384, 256, 128];

function assetLink(asset: string) {
    return `${asset}`;
}

export const impressions = [
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736414603/140920-the-freins_pxauym.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736414603/140920-publikum_lbtjp4.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736414603/141205-jenny-and-the-lovers-1_jdskya.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736414603/141205-jenny-and-the-lovers-2_zorkdn.jpg",
        width: 1000,
        height: 666,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415342/150523-todd-wolfe-1_ujbx5o.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415343/150523-todd-wolfe-3_co8bzg.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415342/150523-todd-wolfe-2_apqupn.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415343/150523-vorband-lord-bishop-rocks_lhn4hh.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415343/150613-cheap-trixx_cddeyi.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415344/150925-ben-granfeldt-1_w6qzqu.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415343/150925-ben-granfeldt-2_xrd2jj.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415344/150925-ben-granfeldt-3_dfyexz.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415344/151121-sarah-smith_dqfwif.jpg",
        width: 1000,
        height: 563,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415344/151219-1-weihnachtsbluesparty-mit-pass-over-blues_dcflbz.jpg",
        width: 1000,
        height: 563,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415739/161111-us-rails-1_bfla0e.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415740/161014-john-campbelljohn-4_yd81lr.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415740/161111-us-rails-3_tbflxj.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415740/161217-pass-over-blues-1_slvsrx.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415740/161111-us-rails-4_izgkkc.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415741/161217-pass-over-blues-2_lzvh5v.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415741/161111-us-rails-2_w80aiw.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415741/161217-pass-over-blues-5_yyaklk.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415741/161217-pass-over-blues-4_qjzenx.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736415742/161217-pass-over-blues-3_rcjdrj.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416178/171014-jaimi-faulkner-4_smymee.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416179/171125-big-fat-shakin-3_foyr2h.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416180/171222-tb-session-band-1_x16vuk.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416180/171222-tb-session-band-3_bobjgy.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416181/171125-big-fat-shakin-4_pm5eif.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416181/171222-tb-session-band-4_wgti8z.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416181/171125-big-fat-shakin-2_pjg2fh.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416181/171125-big-fat-shakin-1_xe4anm.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416181/171222-tb-session-band-5_so4grs.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416181/171222-tb-session-band-2_rmewf6.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416773/181124-frankie-goes-to-liverpool-3_zgrjbo.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416774/181124-frankie-goes-to-liverpool-4_joxxqz.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416774/181124-frankie-goes-to-liverpool-2-1614_dazcla.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416775/181124-frankie-goes-to-liverpool-5_vy5w0z.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416775/181222-stringsband-2_ldq1h8.jpg",
        width: 1000,
        height: 666,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416775/181222-stringsband-1_fz4fwl.jpg",
        width: 1000,
        height: 667,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416776/181222-stringsband-3_l0djbf.jpg",
        width: 1000,
        height: 666,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416776/181222-stringsband-4_mk9t06.jpg",
        width: 1000,
        height: 666,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416777/181222-stringsband-5_wi1i8f.jpg",
        width: 1000,
        height: 666,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736416778/181222-stringsband-6_ob56qh.jpg",
        width: 1000,
        height: 666,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417121/191019-sarah-smith-5_riqtbh.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417122/191221-dirty-work-1_zw5prd.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417121/191019-sarah-smith-6_mbnhte.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417123/191221-dirty-work-4_n4u9e0.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417123/191221-dirty-work-5_wt0cim.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417123/191221-dirty-work-3_ksg1y6.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417122/191221-dirty-work-2_twzn2l.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417124/191221-dirty-work-7_ml4tqd.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417124/191221-dirty-work-6_h6upva.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417126/191019-sarah-smith-4_z7ddm3.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417260/200214-cbb-1_djjps0.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417260/200214-cbb-2_wgc0qy.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417259/200125-manu-lanvin-7_rbmnu3.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417261/200214-cbb-4_oggwcs.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417261/200214-cbb-3_ibstc4.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417264/200214-cbb-6_fifafc.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417264/200214-cbb-7_lfrfok.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417264/200214-cbb-8_sojajg.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417264/200214-cbb-5_fdkpmf.jpg",
        width: 1200,
        height: 800,
    },
    {
        asset: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1736417266/200125-manu-lanvin-6_ve4bi7.jpg",
        width: 1200,
        height: 800,
    }
].map(({asset, width, height}) => ({
    src: assetLink(asset),
    width,
    height,
    srcSet: breakpoints.map((breakpoint) => ({
        src: assetLink(asset),
        width: breakpoint,
        height: Math.round((height / width) * breakpoint),
    }))
}));

export default impressions;