import { NextResponse } from 'next/server';
import db from '@/utils/database';
import cloudinary from '@/utils/cloudinary';
import * as yup from 'yup';
import { UploadApiResponse } from 'cloudinary';
import { MD5 } from 'crypto-js';

const villageProfileSchema = yup.object({
    visi: yup.string().required('Visi is required and must be a string'),
    misi: yup.string().required('Misi is required and must be a string'),
    resident: yup.number().required('Resident is required and must be a number').integer(),
    children: yup.number().required('Children is required and must be a number').integer(),
    mature: yup.number().required('Mature is required and must be a number').integer(),
    old: yup.number().required('Old is required and must be a number').integer(),
});

export const PATCH = async (request: Request, { params }: { params: { id: string } }) => {
    try {
        const formData = await request.formData();
        const data = Object.fromEntries(formData.entries());
        const image = formData.get('image') as File | null;

        await villageProfileSchema.validate(data, { abortEarly: false });
console.log(Number(params.id))
        const existingVillage = await db.villageProfile.findUnique({ where: { id: Number(params.id) } });
        if (!existingVillage) {
            return NextResponse.json({
                error: 'Village profile not found',
                message: 'Village profile not found',
                status: false,
            }, { status: 404 });
        }

        let imagePath = existingVillage.image;

        if (image && typeof image.name === 'string' && typeof image.size === 'number') {

            if (existingVillage.image) {
                const publicId = existingVillage.image.split('/').pop()!.split('.')[0];
                await cloudinary.uploader.destroy(`village_profile/${publicId}`);
            }


            const timestamp = Date.now();
            const imgVillage = `${timestamp}_${MD5(image.name.split(".")[0]).toString()}`;

            const buffer = await image.arrayBuffer();

            const uploadPromise = new Promise<UploadApiResponse>((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'village_profile',
                        public_id: imgVillage,
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result as UploadApiResponse);
                        }
                    }
                );

                stream.end(Buffer.from(buffer));
            });

            const uploadResponse = await uploadPromise;
            imagePath = uploadResponse.secure_url;
        }

        const updatedVillage = await db.villageProfile.update({
            where: { id: Number(params.id) },
            data: {
                ...data,
                id: Number(params.id),
                image: imagePath,
                old: parseInt(data.old as string, 10),
                mature: parseInt(data.mature as string, 10),
                children: parseInt(data.children as string, 10),
                resident: parseInt(data.resident as string, 10),
            },
        });

        return NextResponse.json({
            data: updatedVillage,
            message: "Village profile updated successfully",
            status: true,
        });

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: 'Validation error',
                message: error.errors,
                status: false,
            }, { status: 400 });
        }

        return NextResponse.json({
            error: 'Failed to update village profile',
            message: error.message,
            status: false,
        }, { status: 500 });
    }
};

export const DELETE = async (request: Request, { params }: { params: { id: string } }) => {
    try {
        const villageProfile = await db.villageProfile.findUnique({ where: { id: Number(params.id) } });
        if (!villageProfile) {
            return NextResponse.json({
                error: 'Village profile not found',
                message: 'Village profile not found',
                status: false,
            }, { status: 404 });
        }


        if (villageProfile.image) {
            const publicId = villageProfile.image.split('/').pop()!.split('.')[0];
            await cloudinary.uploader.destroy(`village_profile/${publicId}`);
        }

        await db.villageProfile.delete({ where: { id: Number(params.id) } });

        return NextResponse.json({
            message: "Village profile deleted successfully",
            status: true,
        });

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to delete village profile',
            message: error.message,
            status: false,
        }, { status: 500 });
    }
};
