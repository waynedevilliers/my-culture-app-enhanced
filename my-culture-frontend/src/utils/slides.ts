const breakpoints = [3840, 1920, 1080, 640, 384, 256, 128];

function assetLink(asset: string) {
    return `${asset}`;
}

export const slides = [
    {
        asset: "layout/verein/1.JPG",
        width: 1600,
        height: 1200,
    },
    {
        asset: "layout/verein/2.JPG",
        width: 1024,
        height: 768,
    },
    {
        asset: "layout/verein/3.JPG",
        width: 1024,
        height: 768,
    },
    {
        asset: "layout/verein/4.JPG",
        width: 4032,
        height: 3024,
    },
    {
        asset: "layout/verein/5.JPG",
        width: 3024,
        height: 4032,
    },
    {
        asset: "layout/verein/6.JPG",
        width: 3024,
        height: 4032,
    },
    {
        asset: "layout/verein/7.JPG",
        width: 3024,
        height: 4032,
    },
    {
        asset: "layout/verein/8.JPG",
        width: 4032,
        height: 3024,
    },
    {
        asset: "layout/verein/9.JPG",
        width: 768,
        height: 1024,
    },
    {
        asset: "layout/verein/10.JPG",
        width: 3264,
        height: 2448,
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

export default slides;