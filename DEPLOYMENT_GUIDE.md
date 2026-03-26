# AWS S3 Manual Deployment Guide
This guide provides step-by-step instructions to manually deploy the **Crystal Industries Manufacturing Portal** using the **AWS Management Console**.

> [!IMPORTANT]
> ### 🛑 Fixing "403 Forbidden" / "Access Denied"
> If you have applied the policy and still see 403, please check these specific details:
> 1. **File Structure**: Open your bucket. Do you see `index.html` and the `assets` folder immediately? If you see a `dist` folder, you uploaded it incorrectly. **The files must be in the root of the bucket.**
> 2. **Policy Resource ARN**: In Step 5, ensure your policy resource looks exactly like `arn:aws:s3:::your-bucket-name/*`. **The `/*` (slash and asterisk) at the end is mandatory.**
> 3. **The URL**: Access Denied often happens if you use the wrong URL. Go to the **Properties** tab, scroll to the bottom, and click the link under **Bucket website endpoint**. It must have `s3-website` in the name.
> 4. **Wait a minute**: Sometimes AWS permissions take 60 seconds to propagate globally.

---

## Step 1: Build the Project
Before uploading, you must generate the production files on your computer.
1. Open your terminal in the project folder.
2. Run: `npm run build`
3. This will create a folder named **`dist`**. This is what you will upload.

---

## Step 2: Create S3 Bucket
1. Log in to the [AWS Console](https://console.aws.amazon.com/s3/).
2. Click **Create bucket**.
3. **Bucket name**: Enter a unique name (e.g., `crystal-manufacturing-portal`).
4. **AWS Region**: Select the region closest to you (e.g., `ap-south-1`).
5. **Object Ownership**: Keep "ACLs disabled" (recommended).
6. **Block Public Access settings for this bucket**:
   - **UNCHECK** "Block all public access".
   - Acknowledge the warning that the bucket will become public.
7. Click **Create bucket**.

---

## Step 3: Upload Files
1. Click on your newly created bucket name.
2. Click **Upload**.
3. Open the **`dist`** folder on your computer.
4. **Drag and drop everything INSIDE the `dist` folder** (files and folders) into the S3 upload area.
   - *Note: Do not upload the `dist` folder itself, just its contents.*
5. Click **Upload** at the bottom. Wait for it to finish.

---

## Step 4: Enable Static Website Hosting
1. Go to the **Properties** tab of your bucket.
2. Scroll to the very bottom to **Static website hosting**.
3. Click **Edit**.
4. Select **Enable**.
5. **Index document**: Enter `index.html`.
6. **Error document**: Enter `index.html` (this ensures the app handles routing correctly).
7. Click **Save changes**.
8. **Copy the "Bucket website endpoint" URL** shown at the bottom. *This is your website link.*

---

## Step 5: Configure Permissions (Bucket Policy)
1. Go to the **Permissions** tab.
2. Scroll down to **Bucket policy** and click **Edit**.
3. Copy and paste the following policy (replace `your-bucket-name` with your actual bucket name):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```
4. Click **Save changes**.

---

## Step 6: Test Your Website
Open the **Website Endpoint URL** you copied in Step 4. Your app should now be live!

> [!TIP]
> Since we use **HashRouter**, your URLs will look like `http://.../#/company/login`. This is normal and ensures you never get a 404 error when refreshing the page on S3.
