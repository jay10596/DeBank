import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPost } from '../../helpers/reducers/DeBank';
import { create } from 'ipfs-http-client';

import SectionHeader from '../reusables/SectionHeader';

function PostForm() {
    const dispatch = useDispatch()

    const [content, setContent] = useState('')
    const [media, setMedia] = useState(null)

    // Binding values
    const updateContent = (e) => setContent(e.target.value)
    const updateMedia = (e) => setMedia(e.target.files[0])

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault()

        // Upload media on IPFS and get Hash
        const client = create({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })
        const uploadedMedia = media == null ? null : await client.add(media)

        // Default tip amount is 0 when you create a post
        dispatch(createPost({content: content, mediaHash: uploadedMedia ? uploadedMedia.path : '', tip: 0}))
    }

    return (
        <section>
            <SectionHeader heading="How much you want to deposit?" />

            <form onSubmit={handleSubmit}>
                <label>
                    content:
                    <input type="textarea" name="name" value={content} onChange={updateContent} />
                </label>

                <input type="submit" value="Submit" />
            </form>
        </section>
    );
}

export default PostForm;