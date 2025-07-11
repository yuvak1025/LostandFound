export const getCroppedImg = (imageSrc, crop) => {
    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.src = url;
            image.setAttribute('crossOrigin', 'anonymous'); // For cross-origin images
            image.onload = () => resolve(image);
            image.onerror = reject;
        });

    return new Promise(async (resolve, reject) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const { width, height } = image;
        const aspectRatio = width / height;
        const outputWidth = crop.width;
        const outputHeight = outputWidth / aspectRatio;

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        ctx.drawImage(
            image,
            crop.x,
            crop.y,
            crop.width,
            crop.height,
            0,
            0,
            outputWidth,
            outputHeight
        );

        canvas.toBlob((blob) => {
            resolve(blob); // Return the cropped image as a blob
        }, 'image/jpeg', 0.8);
    });
};
